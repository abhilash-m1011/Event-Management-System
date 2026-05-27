import API from "../services/api";

function PayButton({ eventId }) {

  const payNow = async () => {

    const res = await API.post(`/payment/create-order/${eventId}`);

    const order = res.data;

    const options = {
      key: "YOUR_KEY_ID",
      amount: order.amount,
      currency: "INR",
      name: "Event Registration",
      order_id: order.id,

      handler: async function (response) {

        await API.post("/payment/verify", response);

        alert("Payment Successful");

      }
    };

    const rzp = new window.Razorpay(options);

    rzp.open();

  };

  return (
    <button onClick={payNow}>
      Pay & Register
    </button>
  );
}

export default PayButton;