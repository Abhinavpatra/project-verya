const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;