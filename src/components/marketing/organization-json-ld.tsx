import { brand } from "@/config/brand";

/** Organization structured data — verified legal identity only; no invented socials/ratings. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.legalName,
    alternateName: brand.name,
    url: brand.officialWebsiteUrl,
    email: brand.contactEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: "70 Larch Crescent",
      addressLocality: "Hayes",
      postalCode: "UB4 9DR",
      addressCountry: "GB",
    },
    identifier: {
      "@type": "PropertyValue",
      name: "Company Number",
      value: brand.companyNumber,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
