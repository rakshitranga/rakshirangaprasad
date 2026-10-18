import { Portfolio } from "@/components/portfolio";
import site from "@/data/site.json";

export default function Home() {
  return <Portfolio site={site} />;
}
