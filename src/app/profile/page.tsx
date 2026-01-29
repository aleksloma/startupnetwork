import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StartupForm } from "@/components/startup/StartupForm";
import { Container } from "@/components/layout/Container";
import { deleteStartup } from "@/actions/startup.actions";
import { Button } from "@/components/ui";

export const metadata = {
  title: "My Startup | StartupNetwork",
  description: "Manage your startup profile on StartupNetwork.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  // Get user's startup
  const startup = await prisma.startup.findUnique({
    where: { userId: session.user.id },
    include: {
      founders: { orderBy: { order: "asc" } },
      startupFields: {
        include: { fieldTag: true },
      },
    },
  });

  // If no startup, redirect to create
  if (!startup) {
    redirect("/startup/new");
  }

  // Get field tags for the form
  const fieldTags = await prisma.fieldTag.findMany({
    orderBy: [{ isPredefined: "desc" }, { name: "asc" }],
  });

  return (
    <div className="py-8">
      <Container size="md">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Your Startup</h1>
            <p className="mt-2 text-slate-600">
              Update your startup&apos;s information
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-8">
          <StartupForm fieldTags={fieldTags} initialData={startup} mode="edit" />
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your startup, there is no going back. Please be certain.
          </p>
          <form
            action={async () => {
              "use server";
              await deleteStartup(startup.id);
              redirect("/");
            }}
          >
            <Button type="submit" variant="danger" size="sm">
              Delete Startup
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
