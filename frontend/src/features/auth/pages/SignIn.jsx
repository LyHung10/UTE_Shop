import AuthLayout from "./AuthPageLayout";
import PageMeta from "@/admin/components/common/PageMeta.jsx";
import SignInForm from "@/features/auth/components/SignInForm.jsx";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="UTE Shop | Sign In"
        description="Sign In"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
