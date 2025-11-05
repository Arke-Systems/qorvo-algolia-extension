import React from 'react';

export const metadata = {
  title: 'Contentstack Algolia App',
  description: 'Search and select Algolia records within Contentstack',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}