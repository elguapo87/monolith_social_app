type AuthLayoutProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen } : AuthLayoutProps) => {
  return (
    <div>
      Sidebar
    </div>
  )
}

export default Sidebar
