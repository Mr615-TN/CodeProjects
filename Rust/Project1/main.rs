use std::env;
use std::error::Error;
use futures::{SinkExt, StreamExt};
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use tokio_tungstenite::tungstenite::protocol::Message;
use serde_json::{json, Value};
use serde::Deserialize;

// Define a struct to represent Home Assistant auth response, used for deserialization
#[derive(Deserialize)]
struct AuthResponse {
    #[serde(default)]
    pub message: String,
    pub success: bool,
    #[serde(default)]
    pub error: Option<AuthError>, // Added Option for the error field
}

#[derive(Deserialize)]
struct AuthError {
    pub message: String,
}


// Define a simple struct for a Home Assistant response to a service call
#[derive(Deserialize, Debug)]
struct ServiceResponse {
    pub id: u64,
    pub success: bool,
    pub result: Option<Value>, // Use Option<Value> to handle missing or null 'result'
    pub error: Option<ServiceCallError>,
}

#[derive(Deserialize, Debug)]
struct ServiceCallError {
    pub message: String,
    pub code: String,
}

// Function to establish WebSocket connection and authenticate
async fn connect_and_authenticate(
    hass_url: &str,
    token: &str,
) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, Box<dyn Error>> {
    let (ws_stream, _) = connect_async(hass_url).await?;
    let (mut write, mut read) = ws_stream.split();

    // 1. Send the auth message
    let auth_message = json!({
        "type": "auth",
        "access_token": token,
    });
    write.send(Message::Text(auth_message.to_string())).await?;

    // 2. Read the auth response
    let auth_response_msg = read.next().await.ok_or("No auth response")??;
    let auth_response_text = auth_response_msg.to_text()?;
    let auth_response: AuthResponse = serde_json::from_str(auth_response_text)?;

    if !auth_response.success {
        if let Some(err) = auth_response.error { // Handle the Option
            return Err(format!("Authentication failed: {}", err.message).into());
        } else {
             return Err("Authentication failed: Unknown error".into());
        }
    }

    //Recombine the read and write
    Ok(WebSocketStream::from_raw_socket(
        ws_stream.into_inner(),
        write,
        read,
        tokio_tungstenite::stream::NoStream,
    ))

}

// Function to call a Home Assistant service
async fn call_service(
    ws_stream: &mut WebSocketStream<MaybeTlsStream<TcpStream>>,
    domain: &str,
    service: &str,
    service_data: Value,
) -> Result<ServiceResponse, Box<dyn Error>> {
    static mut NEXT_ID: u64 = 1; // Use a static mut for simplicity.  In a real application, consider a thread-safe counter.
    let id: u64;
    unsafe {
        id = NEXT_ID;
        NEXT_ID += 1;
    }

    let call_service_message = json!({
        "id": id,
        "type": "call_service",
        "domain": domain,
        "service": service,
        "service_data": service_data,
    });

    //println!("Sending service call: {}", call_service_message); //Good For Debug

    ws_stream.send(Message::Text(call_service_message.to_string())).await?;

    // Read the response.  We need to match the ID.
    while let Some(response_message) = ws_stream.next().await {
        let response_text = response_message?.to_text()?;
        let response: ServiceResponse = serde_json::from_str(response_text)?;
        //println!("Received response: {}", response_text); //Good For Debug
        if response.id == id {
            if response.success {
                return Ok(response);
            } else if let Some(err) = response.error {
                return Err(format!("Service call failed: {} (Code: {})", err.message, err.code).into());
            } else {
                return Ok(response); //Return the response, even if not success.
            }

        }
        //If the id does not match, continue looping
    }

    Err("Failed to get a matching response".into())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // 1. Get configuration from environment variables
    let hass_url = env::var("HASS_URL").unwrap_or_else(|_| "ws://localhost:8123/api/websocket".to_string());
    let token = env::var("HASS_TOKEN").expect("HASS_TOKEN environment variable must be set");

    // 2. Connect to Home Assistant and authenticate
    let mut ws_stream = connect_and_authenticate(&hass_url, &token).await?;
    println!("Connected and authenticated with Home Assistant.");

    // 3. Call the hassio.host_update service (or any other service)
    let service_data = json!({}); // Empty data for a simple update.  Adjust as needed.
    let response = call_service(&mut ws_stream, "hassio", "host_update", service_data).await?;

    if response.success {
        println!("Service call was successful!");
        if let Some(result) = response.result {
            println!("Result: {}", result);
        }
    } else {
        println!("Service call was not successful.  Check for errors.");
    }

    // 4. Close the connection (important to do this explicitly)
    ws_stream.close().await?;

    Ok(())
}
