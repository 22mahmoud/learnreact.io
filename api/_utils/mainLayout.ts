const style = `<link rel="stylesheet" href="https://learnreact.io/styles.css" />`;

export const mainLayout = (body: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
      />
      <title>learnreact.io</title>
      ${style}
    </head>
    <body>
      <header>
        <p class="site-title">
          <a href="/"> learnreact.io </a>
        </p>
      </header>

      <main>${body}</main>

      <footer> © <a href="/"> learnreact.io </a> </footer>
    </body>
  </html>
`;
