import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { httpError } from "../utils/httpError.js";
import formatUser from "../utils/formatUser.js";
import { validateProfileInput } from "../utils/validateProfile.js";
import { assertCloudinaryUrl } from "../utils/validators.js";
import { HOST_FIELDS } from "../utils/populateFields.js";

// No email, no password, no coordinates
const PUBLIC_PROFILE_FIELDS = "name profileImage bio interests locationLabel createdAt";

// GET /api/users/:id  (public)
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(PUBLIC_PROFILE_FIELDS);
  if (!user) throw httpError(404, "User not found");

  const upcoming = { status: "active", date: { $gt: new Date() } };
  const hostedFilter = { host: user._id };
  const joinedFilter = { participants: user._id, host: { $ne: user._id } };

  const [hostedActivities, joinedActivities, hostedCount, joinedCount] = await Promise.all([
    Activity.find({ ...upcoming, ...hostedFilter })
      .sort({ date: 1 })
      .limit(20)
      .populate("host", HOST_FIELDS),
    Activity.find({ ...upcoming, ...joinedFilter })
      .sort({ date: 1 })
      .limit(20)
      .populate("host", HOST_FIELDS),
    Activity.countDocuments({ ...hostedFilter, status: { $ne: "cancelled" } }),
    Activity.countDocuments({ ...joinedFilter, status: { $ne: "cancelled" } }),
  ]);

  res.status(200).json({
    success: true,
    user,
    stats: { hosted: hostedCount, joined: joinedCount },
    hostedActivities,
    joinedActivities,
  });
};

// PUT /api/users/profile  (edits the logged-in user, nobody else)
export const updateProfile = async (req, res) => {
  const data = validateProfileInput(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true });

  res.status(200).json({ success: true, user: formatUser(user) });
};

// PUT /api/users/profile-image  body: { profileImage: "<url from /api/uploads/image>" } ("" removes it)
export const updateProfileImage = async (req, res) => {
  const { profileImage } = req.body;
  if (profileImage === undefined) throw httpError(400, "profileImage is required");
  if (profileImage !== "") assertCloudinaryUrl(profileImage, "Profile image");

  const user = await User.findByIdAndUpdate(req.user._id, { profileImage }, { new: true });

  res.status(200).json({ success: true, user: formatUser(user) });
};