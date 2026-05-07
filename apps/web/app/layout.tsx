import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'دانشگاه آنلاین هوشمند | AI-Native University',
  description:
    'پلتفرم دانشگاه آنلاین مبتنی بر هوش مصنوعی — یادگیری تطبیقی، کلاس آنلاین، ارزیابی هوشمند',
  keywords: ['دانشگاه آنلاین', 'هوش مصنوعی', 'یادگیری تطبیقی', 'LMS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
