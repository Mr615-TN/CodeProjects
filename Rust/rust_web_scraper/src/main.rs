struct Product {
    url: Option<String>,
    image: Option<String>,
    name: Option<String>,
    price: Option<String>
}

fn main() {
    let mut products: Vec<Products> = Vec::new();
    let response = reqwest::blocking::get("https://www.newegg.com/");
    
    let html_content = response.unwrap().text().unwrap();
    let document = scraper::Html::parse_document(&html_content);

    let product_selector = scraper::Selector::parse(".item-info").unwrap();
}
