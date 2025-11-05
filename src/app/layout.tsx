import React from 'react';

export const metadata = {
  title: 'Contentstack Algolia App',
  description: 'Search and select Algolia records within Contentstack',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load UI Extensions global SDK early for Custom Field contexts */}
        <script src="https://app.contentstack.com/assets/js/sdk.js" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}