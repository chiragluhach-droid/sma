import { company } from "./content";

export const waLink = (text = company.whatsappText) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
export const telLink = () => `tel:${company.phone.replace(/[^\d+]/g, "")}`;
export const mailLink = () => `mailto:${company.email}?subject=${encodeURIComponent("Alloy wheel enquiry")}`;
export const mapEmbed = () => `https://www.google.com/maps?q=${encodeURIComponent(company.mapQuery)}&output=embed`;
export const mapLink = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.mapQuery)}`;
