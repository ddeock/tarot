const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, '이메일은 필수입니다.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일 형식을 입력해주세요.']
    },
    password: {
        type: String,
        required: [true, '비밀번호는 필수입니다.'],
        minlength: [4, '비밀번호는 최소 4자 이상이어야 합니다.'],
        select: false // 기본적으로 비밀번호는 조회되지 않도록 설정
    },
    name: {
        type: String,
        required: [true, '이름은 필수입니다.'],
        trim: true
    },
    gender: {
        type: String,
        required: false,
        enum: {
            values: ['남자', '여자'],
            message: '성별은 남자 또는 여자 중에서 선택해야 합니다.'
        }
    },
    birthdate: {
        type: Date,
        required: [true, '생년월일은 필수입니다.']
    },
    phone: {
        type: String,
        required: [true, '연락처는 필수입니다.']
    },
    address: {
        type: String,
        required: false
    },
    detailAddress: {
        type: String,
        required: false
    },
    user_type: {
        type: String,
        required: [true, '유저 타입은 필수입니다.'],
        enum: {
            values: ['사용자', '관리자'],
            message: '유저 타입은 사용자 또는 관리자여야 합니다.'
        },
        default: '사용자'
    }
}, {
    timestamps: true // 생성 및 수정 시간 자동 기록
});

// 비밀번호 암호화 (저장 전)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 비밀번호 일치 여부 확인 메서드
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
