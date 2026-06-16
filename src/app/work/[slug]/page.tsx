import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, projectBySlug, person } from "@/content/portfolio";
import ProjectView from "@/components/ProjectView";

export function generateStaticParams() {
  // only full builds earn a case-study page; minis / design live on the wheel
  return projects
    .filter((p) => p.category === "build")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const title = `${p.title} · ${person.first} ${person.last}`;
  return {
    title,
    description: p.tagline,
    openGraph: { title, description: p.tagline, type: "article" },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || p.category !== "build") notFound();
  return <ProjectView slug={slug} />;
}
