import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect, useState } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { useParams } from "react-router-dom";
import { useChatStore } from "../../store/useChatStore";

const Posts = ({feedType, username, userId}) => {

	const [refresh, setRefresh] = useState(false);
	const {isLoadingPOST: isLoading, fetchPosts, POSTS, refreshPosts} = useChatStore()
	const getPostEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "/api/posts/all";
		}
	}
	const POST_ENDPOINT = getPostEndPoint();

	useEffect(() => {
		const fetchPostss = async () => {
			await fetchPosts(POST_ENDPOINT);
		};
		fetchPostss();
	}, [feedType, refresh, POST_ENDPOINT, refreshPosts]);
	const handleRefresh = () => setRefresh(prev => !prev);



	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && POSTS && (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} onRefresh={handleRefresh}/>
					))}
				</div>
			)}
		</>
	);
};
export default Posts;