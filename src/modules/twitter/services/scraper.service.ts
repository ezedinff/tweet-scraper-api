import { Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';

const getTwitterUrl = (username: string) => `https://x.com/${username}`;
const username = '===';
const password = '===';

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

    await page.goto('https://x.com/i/flow/login', {
      waitUntil: 'networkidle2',
    });
    await this.login(page);

    await page.goto(getTwitterUrl(username), { waitUntil: 'networkidle2' }); // Use networkidle2 to ensure all resources are loaded

    const tweets = await this.loadTweets(page);

    const replies = await this.loadReplies(page, username, tweets);

    await browser.close();
    return { tweets, replies };
  }

  async loadTweets(page: Page) {
    const tweets = new Set<string>();
    let previousCount = 0;
    let currentCount = 0;

    while (true) {
      await this.scrollPage(page);
      previousCount = currentCount;

      const newTweets = await page.$$eval(
        'div[data-testid="cellInnerDiv"]',
        (tweetElements) =>
          tweetElements.map((tweetElement) => {
            const textElement = tweetElement.querySelector(
              'div[data-testid="tweetText"]',
            );
            const imageElement = tweetElement.querySelector(
              'div[data-testid="card.layoutLarge.media"] img.css-9pa8cd',
            );
            const videoElement = tweetElement.querySelector(
              'video[preload="none"]',
            );

            const text = textElement ? textElement.textContent.trim() : '';
            const image = imageElement
              ? (imageElement as HTMLImageElement).src
              : '';
            const videoSources = videoElement
              ? Array.from(videoElement.querySelectorAll('source')).map(
                  (sourceElement) => sourceElement.src,
                )
              : [];

            return { text, image, video: videoSources };
          }),
      );

      newTweets.forEach((tweet) => tweets.add(JSON.stringify(tweet)));

      currentCount = tweets.size;

      if (currentCount === previousCount) break;
    }

    return Array.from(tweets).map((tweet) => JSON.parse(tweet));
  }

  async scrollPage(page: Page) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await page.waitForNetworkIdle({ idleTime: 500 }); // Add a delay to allow content to load
  }

  async *getReplyButtons(replyButtons) {
    for (const button of replyButtons) {
      yield button;
    }
  }

  async scrollToEnd(page: Page) {
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForNetworkIdle({ idleTime: 500 }); // Wait for the page to load
      const newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === previousHeight) break; // Exit if no more content is loaded
    }
  }

  async scrollToTop(page: Page) {
    await page.evaluate('window.scrollTo(0, 0)');
    await page.waitForNetworkIdle({ idleTime: 500 });
  }

  async loadReplies(page: Page, username: string, tweets) {
    const replies = [];
    let firstReply = true;
    let i = 0;
    await this.scrollToTop(page);

    for await (const tweet of this.getReplyButtons(tweets)) {
      // await this.scrollToEnd(page);
      await page.evaluate(
        (index, firstReply) => {
          firstReply
            ? (
                document.querySelectorAll('button[data-testid="reply"]')[
                  index
                ] as HTMLElement
              ).click()
            : (
                document.querySelectorAll('div[data-testid="tweetText"]')[
                  index
                ] as HTMLElement
              ).click();
        },
        i,
        firstReply,
      );
      await page.waitForNetworkIdle({ idleTime: 500 }); // Wait for replies to load

      if (firstReply) {
        // await this.prepareForLogin(page);
        // await this.login(page);
        firstReply = false;
      }

      const newReplies = await this.loadTweets(page);
      console.log(newReplies);
      tweet.replies = newReplies;
      replies.push(...newReplies);

      await page.goto(getTwitterUrl(username), { waitUntil: 'networkidle2' });
      i++;
    }
    return replies;
  }

  async prepareForLogin(page: Page) {
    const loginButton = await page.$('a[href="/i/flow/login"]');
    if (loginButton) {
      await loginButton.click();
    }
  }

  async login(page: Page) {
    await page.waitForSelector('input[autocomplete="username"]', {
      visible: true,
    });
    await page.type('input[autocomplete="username"]', username, {
      delay: 50,
    });
    await page.keyboard.press('Enter');

    await page.waitForSelector('input[autocomplete="current-password"]', {
      visible: true,
    });

    await page.type('input[autocomplete="current-password"]', password, {
      delay: 50,
    });
    await page.keyboard.press('Enter');
  }
}
