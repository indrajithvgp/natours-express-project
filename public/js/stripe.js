import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51IL4Y5BJrp2mymXIxuaNxYwp4zAsV7rlS1GL862zajnRGlSg9pB66obUGZS99vAnjoqBlWNLMbSynj7Knv1fYE5w00miq6Otvc');

export const bookTour = async tourId => {
  try {
    
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
    
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};