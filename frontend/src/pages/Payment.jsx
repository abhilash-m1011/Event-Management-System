import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../services/api";
import QRCode from "react-qr-code";

function Payment() {

  const { registrationId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = Number(searchParams.get("amount"));

  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [eventQr, setEventQr] = useState(null);
  const [foodQr, setFoodQr] = useState(null);

  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const num1 = 7;
  const num2 = 3;
  const correctAnswer = num1 + num2;

  useEffect(() => {
    // ✅ FIX 1: Load Razorpay script reliably with a cleanup check
    const existingScript = document.getElementById("razorpay-script");
    if (existingScript) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setError("Failed to load Razorpay SDK. Check your internet connection.");

    document.body.appendChild(script);
  }, []);

  const handleDownload = async () => {
    try {
      const response = await API.get(
        `/ticket/download/${registrationId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${registrationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // ✅ FIX 2: Free memory after download

    } catch (err) {
      console.error(err);
      setError("Failed to download ticket. Please try again.");
    }
  };

  const handlePayment = async () => {

    if (!razorpayLoaded) {
      setError("Payment system not ready. Please wait a moment and try again.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Invalid payment amount.");
      return;
    }

    if (Number(captchaAnswer) !== correctAnswer) {
      setError(`Incorrect answer. ${num1} + ${num2} = ${correctAnswer}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ FIX 3: Route now matches backend — /payment/create-order/{registrationId}
      //           Previously backend had {event_id} but frontend sent registrationId
      const orderRes = await API.post(
        `/payment/create-order/${registrationId}`,
        { amount: amount }
      );

      const order = orderRes.data;

      const options = {
        key: "rzp_test_SOHcDMaDPi0Xjb",
        amount: order.amount,       // already in paise from backend
        currency: order.currency,   // ✅ FIX 4: use currency from order response, not hardcoded

        name: "Symposium OS",
        description: "Event Registration Payment",

        order_id: order.id,

        // ✅ FIX 5: Test mode card details — use Razorpay test card for checkout
        //           Card: 4111 1111 1111 1111 | CVV: any 3 digits | Expiry: any future date
        //           These prefill values help testers in test mode
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },

        // ✅ FIX 6: Add config to show card payment method prominently in test mode
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay via Card / UPI / NetBanking",
                instruments: [
                  { method: "card" },
                  { method: "upi" },
                  { method: "netbanking" }
                ]
              }
            },
            sequence: ["block.banks"],
            preferences: { show_default_blocks: false }
          }
        },

        theme: { color: "#7c3aed" },

        handler: async function (response) {
          try {
            // ✅ FIX 7: Verify payment on backend
            await API.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            // Generate QR codes — payment_status is now "success" before this runs
            const qrRes = await API.post(`/qr/generate/${registrationId}`);
            setEventQr(qrRes.data.event_qr);
            setFoodQr(qrRes.data.food_qr);

            setPaymentSuccess(true);

          } catch (err) {
            console.error("Post-payment error:", err);
            const msg = err.response?.data?.detail || "Payment verification failed. Contact support.";
            setError(msg);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay failure:", response.error);
        // ✅ FIX 10: Show human-readable error from Razorpay instead of generic message
        setError(response.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();

    } catch (err) {
      console.error("Order creation error:", err);
      const msg = err.response?.data?.detail || "Could not initialise payment. Please try again.";
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050818",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      fontFamily: "sans-serif"
    }}>

      <div style={{
        width: "420px",
        background: "rgba(8,13,46,0.9)",
        padding: "40px",
        borderRadius: "16px",
        color: "white",
        boxShadow: "0 0 40px rgba(124,58,237,0.3)"
      }}>

        {!paymentSuccess ? (

          <>
            <h2 style={{ marginTop: 0 }}>Confirm Payment</h2>

            <div style={{
              background: "#11163a",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "15px",
              fontSize: "18px",
              fontWeight: "bold"
            }}>
              Total: ₹{amount}
            </div>

            {/* ✅ Use Razorpay domestic Indian test card — international cards are blocked */}
            <div style={{
              marginTop: "15px",
              background: "#1a2a1a",
              border: "1px solid #2d5a2d",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#86efac",
              lineHeight: "1.6"
            }}>
              🧪 <strong>Test Mode — Use this card:</strong><br />
              Card: <code style={{background:"#0d1a0d",padding:"2px 5px",borderRadius:"4px"}}>5267 3181 8797 5449</code><br />
              Expiry: <code style={{background:"#0d1a0d",padding:"2px 5px",borderRadius:"4px"}}>08/26</code> &nbsp;
              CVV: <code style={{background:"#0d1a0d",padding:"2px 5px",borderRadius:"4px"}}>123</code><br />
              OTP: <code style={{background:"#0d1a0d",padding:"2px 5px",borderRadius:"4px"}}>1234</code>
            </div>

            <div style={{ marginTop: "20px" }}>
              <p style={{ margin: "0 0 8px" }}>
                Captcha: {num1} + {num2} = ?
              </p>
              <input
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter answer"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: "1px solid #334",
                  background: "#0d1130",
                  color: "white",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {error && (
              <div style={{
                marginTop: "15px",
                background: "#3b0d0d",
                border: "1px solid #7f1d1d",
                padding: "10px 14px",
                borderRadius: "6px",
                color: "#fca5a5",
                fontSize: "14px"
              }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "14px",
                background: loading ? "#4c1d95" : "#7c3aed",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
            >
              {loading ? "Processing..." : !razorpayLoaded ? "Loading..." : "Pay with Razorpay"}
            </button>
          </>

        ) : (

          <>
            <h2 style={{ textAlign: "center", marginTop: 0, color: "#86efac" }}>
              ✅ Payment Successful!
            </h2>

            <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "24px" }}>
              Your registration is confirmed. Scan the QR codes below at the event.
            </p>

            {eventQr && (
              <div style={{
                textAlign: "center",
                marginTop: "20px",
                background: "#11163a",
                padding: "20px",
                borderRadius: "12px"
              }}>
                <p style={{ marginBottom: "12px", fontWeight: "bold" }}>🎟 Event Entry QR</p>
                {/* ✅ FIX 12: White background wrapper — QR codes need contrast to scan */}
                <div style={{ background: "white", display: "inline-block", padding: "12px", borderRadius: "8px" }}>
                  <QRCode value={String(eventQr)} size={160} />
                </div>
              </div>
            )}

            {foodQr && (
              <div style={{
                textAlign: "center",
                marginTop: "16px",
                background: "#11163a",
                padding: "20px",
                borderRadius: "12px"
              }}>
                <p style={{ marginBottom: "12px", fontWeight: "bold" }}>🍽 Food Access QR</p>
                <div style={{ background: "white", display: "inline-block", padding: "12px", borderRadius: "8px" }}>
                  <QRCode value={String(foodQr)} size={160} />
                </div>
              </div>
            )}

            <button
              onClick={handleDownload}
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "14px",
                background: "#16a34a",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              ⬇️ Download Ticket PDF
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default Payment;