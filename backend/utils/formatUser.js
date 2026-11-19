const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profileImage: user.profileImage,
  bio: user.bio,
  interests: user.interests,
  locationLabel: user.locationLabel,
});

export default formatUser;