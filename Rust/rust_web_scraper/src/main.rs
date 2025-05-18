struct Product {
    url: Option<String>,
    image: Option<String>,
    name: Option<String>,
    price: Option<String>
}

fn main() {
    let mut products: Vec<Product> = Vec::new();
    let response = reqwest::blocking::get("https://scrapingcourse.com/ecommerce/");
    
    let html_content = response.unwrap().text().unwrap();
    let document = scraper::Html::parse_document(&html_content);

    let html_product_selector = scraper::Selector::parse(".item-info").unwrap();
    let products_html = document.select(&html_product_selector);

    for product in products_html {
        let url = product
            .select(&scraper::Selector::parse("a").unwrap())
            .next()
            .and_then(|a| a.value().attr("href"))
            .map(str::to_owned);
        let image = product
            .select(&scraper::Selector::parse("img").unwrap())
            .next()
            .and_then(|img| img.value().attr("src"))
            .map(str::to_owned);
        let name = product
            .select(&scraper::Selector::parse("h2").unwrap())
            .next()
            .map(|h2| h2.text().collect::<String>());
        let price = product
            .select(&scraper::Selector::parse(".price").unwrap())
            .next()
            .map(|price| price.text().collect::<String>());
        let product = Product {
            url,
            image,
            name,
            price,
        };
        products.push(product);
    }
    let path = std::path::Path::new("products.csv");
    let mut writer = csv::Writer::from_path(path).unwrap();

    writer
        .write_record(&["url", "image", "name", "price"])
        .unwrap();
    for product in products {
        let url = product.url.unwrap();
        let image = product.image.unwrap();
        let name = product.name.unwrap();
        let price = product.price.unwrap();
        writer.write_record(&[url, image, name, price]).unwrap();
    }
    writer.flush().unwrap();
}
