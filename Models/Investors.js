// // Schema for Investors
// const InvestorSchema = new mongoose.Schema({
//   userName: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   email: {
//     value: { type: String, unique: true, required: true },
//     confirm: { type: Boolean, default: false },
//   },
//   phoneNumber: {
//     value: { type: String, unique: true, required: true },
//     confirm: { type: Boolean, default: false },
//   },
//   nationalId: {
//     pic: { type: String, required: true },
//     confirm: { type: Boolean, default: false },
//   },
//   paymentData: {
//     token: { type: String, required: true },
//     name: { type: String, required: true },
//     last4Numbers: { type: String, required: true },
//   },
//   myProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
// });
