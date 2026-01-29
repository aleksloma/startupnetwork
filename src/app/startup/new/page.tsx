import { Container } from "@/components/layout/Container";
import Link from "next/link";

export const metadata = {
  title: "Add Your Startup | StartupNetwork",
  description: "Register your startup on StartupNetwork and connect with other founders.",
};

export default function NewStartupPage() {
  return (
    <div className="py-16">
      <Container size="sm">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Add Your Startup
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            To add your startup to the directory, please contact the Startupbootcamp team.
          </p>
          <div className="space-y-4">
            <a
              href="mailto:startups@startupbootcamp.org?subject=Add%20My%20Startup%20to%20StartupNetwork"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </a>
            <div>
              <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
