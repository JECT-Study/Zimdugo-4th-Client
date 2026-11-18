export const NOINDEX_NOFOLLOW_ROBOTS_CONTENT = "noindex, nofollow";

export const createNoIndexNoFollowHead = () => ({
  meta: [
    {
      name: "robots",
      content: NOINDEX_NOFOLLOW_ROBOTS_CONTENT,
    },
  ],
});

/**
 * 색인은 막되 링크는 따라가게 한다.
 *
 * 검색 결과처럼 검색어마다 내용이 달라 따로 색인될 이유는 없지만, 그 안의 상세
 * 링크는 크롤러가 따라가야 하는 페이지에 쓴다.
 */
export const NOINDEX_FOLLOW_ROBOTS_CONTENT = "noindex, follow";

export const createNoIndexFollowMeta = () => ({
  name: "robots",
  content: NOINDEX_FOLLOW_ROBOTS_CONTENT,
});
