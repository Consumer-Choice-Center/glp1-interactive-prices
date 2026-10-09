import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"GLP-1 Cash Prices | Consumer Choice Center",description:"Explore sourced GLP-1 cash-price histories, manufacturer offers, and policy timelines in an interactive Consumer Choice Center research project."};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
