import { useParams } from "react-router-dom";
import Catalog from "../components/Catalog";

export default function CategoryPage() {
  const { slug } = useParams();
  return <Catalog categorySlug={slug} title={`${decodeURIComponent(slug)} Sarees`} />;
}

