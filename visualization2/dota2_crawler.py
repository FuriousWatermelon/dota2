import os
import requests
from scrapy.spiders import Spider
from scrapy.http import Request

HERO_IMAGE_PATH = "./image/heros"
ITEM_IMAGE_PATH = "./image/items"
os.makedirs(HERO_IMAGE_PATH, exist_ok=True)
os.makedirs(ITEM_IMAGE_PATH, exist_ok=True)


class Dota2Spider(Spider):
    name = "dota2_spider"
    start_urls = ["https://dota2.gamepedia.com/Heroes", "https://dota2.gamepedia.com/Items"]

    def parse_heros(self, response):
        contents = response.xpath('//*[@id="mw-content-text"]/div/table[1]/tbody/tr[*]/td/div[*]/div[1]/a')

        for i, content in enumerate(contents):
            name = content.xpath("@title").extract()[0]
            image_url = content.xpath("img").xpath("@src").extract()[0]

            print("download hero {}/{}: {}".format(i + 1, len(contents), name))
            with open(os.path.join(HERO_IMAGE_PATH, "{}.jpg".format(name)), "wb") as file:
                file.write(requests.get(image_url).content)

    def parse_item(self, response):
        contents = response.xpath('//div[@class = "itemlist"]/div/a')

        contents = contents[::2]
        for i, content in enumerate(contents):
            name = str(content.xpath("@title").extract()[0]).split("(")[0]
            image_url = content.xpath("img").xpath("@src").extract()[0]
            print("download item {}/{}: {}".format(i + 1, len(contents), name))
            with open(os.path.join(ITEM_IMAGE_PATH, "{}.jpg".format(name)), "wb") as file:
                file.write(requests.get(image_url).content)

    def start_requests(self):
        yield Request("https://dota2.gamepedia.com/Heroes", callback=self.parse_heros)
        yield Request("https://dota2.gamepedia.com/Items", callback=self.parse_item)
