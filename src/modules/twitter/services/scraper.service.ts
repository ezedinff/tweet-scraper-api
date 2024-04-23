import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

const getTwitterUrl = (username: string) => `https://twitter.com/${username}`;

@Injectable()
export class ScraperService {
  async scrapeTwitterData(username: string) {
    const browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: null, // Remove default viewport
      args: ['--start-maximized'], // Maximize the browser window
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000); // Set default navigation timeout
    await page.goto(getTwitterUrl(username), { waitUntil: 'networkidle2' }); // Use networkidle2 to ensure all resources are loaded

    const tweets = [];

    // Function to scroll down the page
    const scrollPage = async () => {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight); // Scroll down by the height of the viewport
      });
      await page.waitForNetworkIdle({ idleTime: 500 }); // Wait for some time after scrolling
    };

    // Scroll down to load more tweets until no new tweets are loaded
    while (true) {
      await scrollPage();

      // Check if there are new tweets loaded
      const newTweetsCount = await page.$$eval(
        'div[data-testid="cellInnerDiv"]',
        (tweetElements, tweets) =>
          tweetElements.filter((tweetElement) => {
            const textElement = tweetElement.querySelector(
              'div[data-testid="tweetText"]',
            );
            const text = textElement ? textElement.textContent.trim() : '';
            return !tweets.some((tweet) => tweet.text === text);
          }).length,
        tweets,
      );

      if (newTweetsCount === 0) {
        break;
      }

      const newTweets = await page.$$eval(
        'div[data-testid="cellInnerDiv"]',
        async (tweetElements) => {
          const promises = tweetElements.map(async (tweetElement) => {
            const textElement = tweetElement.querySelector(
              'div[data-testid="tweetText"]',
            );
            const imageElement = tweetElement.querySelector(
              'div[data-testid="card.layoutLarge.media"] img.css-9pa8cd',
            );
            const videoElement = tweetElement.querySelector(
              'video[preload="none"]',
            );

            let videoSources = [];
            if (videoElement) {
              const sourceElements = videoElement.querySelectorAll('source');
              videoSources = Array.from(sourceElements).map(
                (sourceElement) => sourceElement.src,
              );
            }

            const text = textElement ? textElement.textContent.trim() : '';
            const image = imageElement
              ? (imageElement as HTMLImageElement).src
              : '';

            return { text, image, video: videoSources };
          });
          return Promise.all(promises);
        },
      );

      tweets.push(...newTweets);
    }

    await browser.close();
    return tweets;
  }
}
