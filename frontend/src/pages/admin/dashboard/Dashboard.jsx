import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../../store/useAdmin";
import {
  UserX,
  UserCheck,
  Users,
  FileWarning,
  Activity,
  Flame,
} from "lucide-react";

const Dashboard = () => {
  const { fetchAdminReport, fetchAnalytics } = useAdminStore();
  const [stats, setStats] = useState({
    blockedUsers: 0,
    unblockedUsers: 0,
    totalReportedPosts: 0,
    totalUsers: 0,
    activeUsers: 0,
    popularPosts: {}, // Khởi tạo popularPosts là một đối tượng
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const report = await fetchAdminReport();
        const analytics = await fetchAnalytics();
        const { overview } = report;

        setStats({
          blockedUsers: overview.blockedUsers,
          unblockedUsers: overview.unblockedUsers,
          totalReportedPosts: overview.totalReportedPosts,
          totalUsers: overview.blockedUsers + overview.unblockedUsers,
          activeUsers: analytics.activeUsers,
          popularPosts: analytics.popularPosts, // Chuyển dữ liệu bài viết nổi bật từ analytics
        });
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error);
      }
    };

    fetchStats();
  }, []);

  const data = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: <Users size={32} />,
      gradient: "from-gray-700 to-gray-900",
    },
    {
      title: "Người dùng bị chặn",
      value: stats.blockedUsers,
      icon: <UserX size={32} />,
      gradient: "from-red-600 to-red-800",
    },
    {
      title: "Người dùng bình thường",
      value: stats.unblockedUsers,
      icon: <UserCheck size={32} />,
      gradient: "from-blue-600 to-blue-800",
    },
    {
      title: "Bài viết bị báo cáo",
      value: stats.totalReportedPosts,
      icon: <FileWarning size={32} />,
      gradient: "from-yellow-500 to-yellow-700",
    },
    {
      title: "Người dùng hoạt động",
      value: stats.activeUsers,
      icon: <Activity size={32} />,
      gradient: "from-green-600 to-green-800",
    },
  ];

  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-white">📊 Thống kê quản trị</h1>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {data.map((item, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${item.gradient} text-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 duration-300 flex items-center gap-4`}
          >
            <div className="bg-white/20 p-3 rounded-full">{item.icon}</div>
            <div>
              <p className="text-sm text-white/80">{item.title}</p>
              <p className="text-2xl font-bold">
                {typeof item.value === "number" ? item.value : "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
