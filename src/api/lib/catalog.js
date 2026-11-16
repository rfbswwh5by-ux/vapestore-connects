import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { categoryImage } from "@/lib/defaultMedia";

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "special_order", label: "Special order" },
];

export const AVAILABILITY_LABELS = AVAILABILITY_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

function withFallbackImage(product) {
  return { ...product, image_url: product.image_url || categoryImage(product.category) };
}

export function useCatalog() {
  const [state, setState] = useState({ products: [], categories: [], loading: true });

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Product.filter({ is_visible: true }, { limit: 300, sort: "sort_order" }),
      base44.entities.ProductCategory.filter({ is_visible: true }, { limit: 100, sort: "sort_order" }),
    ])
      .then(([productPage, categoryPage]) => {
        if (!alive) return;
        const products = (productPage.items || []).map(withFallbackImage);
        const categories = (categoryPage.items || []).map((category) => ({
          ...category,
          image_url: category.image_url || categoryImage(category.name),
          count: products.filter((product) => product.category === category.name).length,
        }));
        setState({ products, categories, loading: false });
      })
      .catch(() => {
        if (alive) setState({ products: [], categories: [], loading: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function useFaqs() {
  const [faqs, setFaqs] = useState([]);
  useEffect(() => {
    let alive = true;
    base44.entities.FaqItem.filter({ is_visible: true }, { limit: 200, sort: "sort_order" })
      .then((page) => alive && setFaqs(page.items || []))
      .catch(() => alive && setFaqs([]));
    return () => {
      alive = false;
    };
  }, []);
  return faqs;
}