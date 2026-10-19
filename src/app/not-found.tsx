import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="label-caps text-white/40">404</p>
      <h1 className="display-xl text-3xl text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page you requested does not exist or was moved.
      </p>
      <Link href="/" className="btn-cream mt-2">
        Back home
      </Link>
    </div>
  );
}
