export const getDashboardOptions = (req, res) => {
  const { role } = req.user; 

  if (role === "admin") {
    return res.status(200).json({
      success: true,
      options: [
        { name: "Dashboards", link: "/admin/dashboard", icon: "FaTachometerAlt" },
        { name: "Users", link: "/admin/users", icon: "FaUserCog" },
        { name: "Chat Logs", link: "/admin/chat-logs", icon: "FaClipboardList" },
        { name: "Roles", link: "/admin/roles", icon: "FaUserTag" },
      ],
    });
  } else if (role === "user") {
    return res.status(200).json({
      success: true,
      options: [
        { name: "Dashboards", link: "/dashboard", icon: "FaTachometerAlt" },
        { name: "Get ChatBot", link: "/get-chatbot", icon: "FaRobot" },
        { name: "Chats", link: "/chats", icon: "FaComments" },
        // { name: "Analytics", link: "/analytics", icon: "FaChartBar" },
        { name: "Train Agent", link: "/training", icon: "FaGlobeAmericas" },
        { name: "Leads", link: "/leads", icon: "FaUserFriends" },
        { name: "User feedback", link: "/user-feedback", icon: "FaCommentDots" },
      ],
    });
  } else {
    return res.status(403).json({
      success: false,
      message: "Role not recognized.",
    });
  }
};