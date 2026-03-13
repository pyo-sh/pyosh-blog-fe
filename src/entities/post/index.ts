export type {
  FetchPostsParams,
  Post,
  PostTag,
  PostCategory,
  PostNavigation,
  PostDetailResponse,
  PostDetailWithNavigationResponse,
  CreatePostBody,
  UpdatePostBody,
} from "./model";
export {
  fetchAdminPost,
  fetchPostBySlug,
  fetchPosts,
  createPost,
  updatePost,
} from "./api";
