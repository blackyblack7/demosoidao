import { ContactSection } from "@/components/sections/ContactSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | SoidaoWittaya School",
  description: "Get in touch with SoidaoWittaya School. Contact us for any inquiries, suggestions, or information.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactSection />
    </main>
  );
}
