import Full from 'Container/Full'
const Booking = () => import('Views/booking/Booking');

export default {
  path: '/',
  component: Full,
  redirect: '/booking',
  children: [
    {
      path: '/booking',
      component: Booking,
      meta: {
        requiresAuth: true,
        title: 'message.booking',
        breadcrumb: 'Booking'
      }
    },
  ]
}