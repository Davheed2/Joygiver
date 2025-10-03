import { baseTemplate } from './baseTemplate';

export const welcomeEmail = (data: { name: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

    <p>
      Welcome to <strong>Joygiver</strong>! the easiest way to create, share, and receive contributions toward your wishes. 🎁
    </p>

    <p>
      You’re now part of a community where friends, family, and supporters can help bring your goals, dreams, and celebrations to life.
    </p>

    <p>
      <strong>Why Joygiver?</strong><br/>
      ✨ Create your wishlist, share it with anyone, and let people contribute directly, safely and securely.
    </p>

    <h3>🌟 Here’s what you can do with Joygiver:</h3>
    <ul>
      <li><strong>Create your wishlist</strong> in minutes, add items, goals, or experiences</li>
      <li><strong>Share your unique link</strong> with friends, family, or supporters</li>
      <li><strong>Receive contributions</strong> directly to your account</li>
      <li>Celebrate life’s milestones with <strong>support from your community</strong></li>
    </ul>

    <p>
      Whether it’s a birthday, a special project, or just a dream you’ve always wanted to fulfill, Joygiver helps you make it happen with the support of those who care about you.
    </p>

    <p>
      Simple. Secure. Joyful. That’s giving and receiving the <strong>Joygiver way</strong>.
    </p>

    <hr style="margin: 24px 0;" />

    <h3>🔒 Your trust matters:</h3>
    <ul>
      <li>We use <strong>bank-grade security</strong> for safe transactions</li>
      <li>Your data and contributions are always <strong>protected</strong></li>
      <li>Transparent fees and <strong>no hidden costs</strong></li>
    </ul>

    <p>Want to get started?</p>
    <p>
      <a href="https://www.joygiver.com/start" style="color: #1D4ED8; font-weight: bold;">Create your first wishlist →</a>
    </p>

    <hr style="margin: 24px 0;" />

    <p>
      We can’t wait to see the wishes you’ll bring to life.<br />
      <strong>Here’s to making joy happen together.</strong><br />
      – The Joygiver Team
    </p>`
	);
};
