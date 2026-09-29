import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"GLP-1 Universe | U.S. Weight Management Medicines",description:"Explore FDA-approved GLP-1 and dual GIP/GLP-1 weight-management medicines, presentations and doses in an interactive universe."};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
