export const NOINDEX_NOFOLLOW_ROBOTS_CONTENT = "noindex, nofollow";

export const createNoIndexNoFollowHead = () => ({
  meta: [
    {
      name: "robots",
      content: NOINDEX_NOFOLLOW_ROBOTS_CONTENT,
    },
  ],
});
