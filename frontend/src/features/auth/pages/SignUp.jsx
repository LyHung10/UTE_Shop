import AuthLayout from "./AuthPageLayout";
import PageMeta from "@/admin/components/common/PageMeta.jsx";
import SignUpForm from "@/features/auth/components/SignUpForm.jsx";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="UTE Shop | Sign Up"
        description="Login"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
