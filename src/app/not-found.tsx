import Link from "next/link";
import { Button } from "@/components/ui";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Container size="sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-slate-900">404</h1>
          <p className="mt-4 text-xl text-slate-600">Page not found</p>
          <p className="mt-2 text-slate-500">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
