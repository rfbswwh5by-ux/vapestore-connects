// Fallback photography used until the shop owner uploads their own images.
// One dedicated image per placement.
export const MEDIA = {
  hero: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/a121a4c1b_generated_image.png",
  store: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/aad50c721_generated_image.png",
  disposables: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/9c0f0ece8_generated_image.png",
  devices: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/33fd936f6_generated_image.png",
  eliquids: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/3204b932e_generated_image.png",
  coils: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/a39afcdbc_generated_image.png",
  accessories: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/0401e4e65_generated_image.png",
  components: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/7ca6799f2_generated_image.png",
  salts: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/d71162c05_generated_image.png",
  pods: "https://media.base44.com/images/public/6afb193c7ea9a9f41e503940/b51e58a0e_generated_image.png",
};

export function categoryImage(name) {
  const key = String(name || "").toLowerCase();
  if (key.includes("disposable")) return MEDIA.disposables;
  if (key.includes("salt")) return MEDIA.salts;
  if (key.includes("liquid") || key.includes("juice")) return MEDIA.eliquids;
  if (key.includes("coil")) return MEDIA.coils;
  if (key.includes("access") || key.includes("tool")) return MEDIA.accessories;
  if (key.includes("replacement") || key.includes("glass") || key.includes("tank")) return MEDIA.components;
  if (key.includes("device") || key.includes("mod") || key.includes("kit") || key.includes("pod")) return MEDIA.devices;
  return MEDIA.devices;
}

export const productImage = (imageUrl, category) => imageUrl || categoryImage(category);