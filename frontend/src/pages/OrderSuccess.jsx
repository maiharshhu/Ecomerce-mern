import { useParams } from "react-router";
import { useNavigate } from "react-router";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-slate-600 mb-1">Thank you for your order.</p>
        {id && (
          <p className="text-sm text-slate-500 mb-6">
            Order ID: <span className="font-mono text-slate-700">{id}</span>
          </p>
        )}
        <button
          onClick={goHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
