interface GtmContainerProps {
  containerId: string | undefined;
}

const getContainerId = (containerId: string | undefined) => containerId?.trim();

const createGtmScript = (containerId: string) => `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(containerId)});
`;

export function GtmHeadScript({ containerId }: GtmContainerProps) {
  const normalizedContainerId = getContainerId(containerId);

  if (!normalizedContainerId) {
    return null;
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static GTM bootstrap script includes only a build-time container ID
      dangerouslySetInnerHTML={{
        __html: createGtmScript(normalizedContainerId),
      }}
    />
  );
}

export function GtmBodyNoscript({ containerId }: GtmContainerProps) {
  const normalizedContainerId = getContainerId(containerId);

  if (!normalizedContainerId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        height="0"
        src={`https://www.googletagmanager.com/ns.html?id=${normalizedContainerId}`}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
        width="0"
      />
    </noscript>
  );
}
