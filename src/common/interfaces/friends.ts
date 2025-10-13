export interface IFriendship {
	id: string;
	userId: string;
	friendId: string;
	status: 'pending' | 'accepted' | 'blocked';
	source: string;
	created_at: Date;
	updated_at: Date;
}

export interface IFriendsList {
	totalFriends: number;
	friends: Array<{
		id: string;
		name: string;
		email: string;
		initials: string;
		hasActiveWishlist: boolean;
		wishlistCount: number;
		lastActive: Date;
		friendSince: Date;
	}>;
}
