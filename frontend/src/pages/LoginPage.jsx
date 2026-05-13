import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import SocialLogin from "../components/auth/SocialLogin";
import axios from "axios"; // ✅ Yeh line add karna compulsory hai
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const FormInput = ({ label, type, placeholder, value, onChange, leftElement, rightElement }) => {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative group">
        {leftElement && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftElement}
          </div>
        )}

      <input
        type={type}
        className={`w-full ${leftElement ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'} mb-2 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none dark:text-white transition-all`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      setShowLogoutAlert(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowLogoutAlert(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.token) {
        login(response.data);
        toast.success("Logged in successfully!");
        // Redirect to onboarding if profile is incomplete, otherwise dashboard
        if (!response.data.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials!");
    }
  };

  return (
    <AuthLayout title="Sign In to Continue" subtitle="Welcome back! Choose how you'd like to sign in">
      {showLogoutAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-teal-500 text-white px-8 py-3 rounded-2xl shadow-2xl font-bold border-2 border-white/20">
            ✅ You have been logged out successfully!
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <SocialLogin />
        
         <div className="flex items-center">
              <div className="flex-1 border-t  border-gray-400"></div>
              <span className="px-4 text-sm  text-black bg-white">Or Continue With</span>
              <div className="flex-1 border-t  border-gray-400"></div>
         </div>
        
        <FormInput label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
        leftElement={
            <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors" />
          }
        />

        <FormInput label="Password"  type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
        leftElement={
            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors" />
          }

        rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? 
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" /> : 
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" />
              }
            </button>
          }
        />

       <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5 border-2 rounded-md accent-blue-500 cursor-pointer"/>
              <label className="text-md font-semibold text-black dark:text-white cursor-pointer">
                Remember Me
              </label>
            </span>

            <Link to="/forgot-password" className="text-md font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
              Forgot Password?
            </Link>
       </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-pink-500 text-white font-black shadow-lg hover:scale-[1.02] transition-all">
          LOG IN
        </button>
        
      <p className="text-center mt-6 text-sm text-muted">
        Don't have an account? <Link to="/signup" className="font-bold text-blue-500">Create Account</Link>
      </p>
    </form>
    </AuthLayout>
  );
};

export default LoginPage;