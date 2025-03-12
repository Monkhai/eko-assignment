# Considerations

## Views counting

I decided to count views by session. This means that a user can watch a video multiple times and raise the view count. This could be exploited by a user to raise the view count of a video. A watch counts as a view if the user has watched more than 25% of the video.

## Vote counting

I decided to count votes per user. This means that each user can only vote once. Since no authentication was implemented, this was saved to localStorage and can also be exploited by a user to vote multiple times.
