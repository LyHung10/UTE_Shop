import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserProfile from "@/features/user/pages/UserProfile.jsx";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
    return (
        <>
            <PageMeta title="Admin UTE Shop | User Profile" />
            <PageBreadcrumb pageTitle="User Profile" />
            <UserProfile />
        </>
    );
}
