package domain

import (
	"time"
)

type Role string

const (
	RoleMiembro    Role = "miembro"
	RoleApoyo      Role = "apoyo"
	RoleApoyo2     Role = "apoyo2"
	RolePastoral   Role = "pastoral"
	RoleSuperAdmin Role = "superadmin"
)

type User struct {
	ID           string     `json:"id"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	FullName     string     `json:"full_name"`
	Phone        string     `json:"phone"`
	Birthday     *time.Time `json:"birthday,omitempty"`
	InvitedByID  *string    `json:"invited_by_id,omitempty"`
	InvitedBy    *string    `json:"invited_by_name,omitempty"`
	Role         Role       `json:"role"`
	Active       bool       `json:"active"`
	AvatarURL    string     `json:"avatar_url"`
	Notes        string     `json:"notes"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type ServiceStatus string

const (
	ServiceUpcoming  ServiceStatus = "upcoming"
	ServicePast      ServiceStatus = "past"
	ServiceCancelled ServiceStatus = "cancelled"
)

type Service struct {
	ID             string        `json:"id"`
	Title          string        `json:"title"`
	ScheduledAt    time.Time     `json:"scheduled_at"`
	Status         ServiceStatus `json:"status"`
	Location       string        `json:"location"`
	Description    string        `json:"description"`
	FeedbackPrompt string        `json:"feedback_prompt"`
	QRToken        string        `json:"qr_token"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}

type Attendance struct {
	ID          string    `json:"id"`
	ServiceID   string    `json:"service_id"`
	UserID      string    `json:"user_id"`
	CheckInTime time.Time `json:"check_in_time"`
	IsEarly     bool      `json:"is_early"`
	CheckedInBy *string   `json:"checked_in_by,omitempty"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UserName    string    `json:"user_name,omitempty"`
	UserEmail   string    `json:"user_email,omitempty"`
	UserRole    Role      `json:"user_role,omitempty"`
	ServiceTitle string   `json:"service_title,omitempty"`
}

type PointsCategory string

const (
	CategoryAttendance PointsCategory = "attendance"
	CategoryGame       PointsCategory = "game"
	CategoryInvite     PointsCategory = "invite"
	CategoryChallenge  PointsCategory = "challenge"
	CategoryReflection PointsCategory = "reflection"
	CategoryManual     PointsCategory = "manual"
	CategoryBonus      PointsCategory = "bonus"
)

type PointsLedger struct {
	ID        string         `json:"id"`
	UserID    string         `json:"user_id"`
	Points    int            `json:"points"`
	Reason    string         `json:"reason"`
	Category  PointsCategory `json:"category"`
	GrantedBy *string        `json:"granted_by,omitempty"`
	ServiceID *string        `json:"service_id,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
}

type UserRanking struct {
	UserID      string `json:"user_id"`
	FullName    string `json:"full_name"`
	AvatarURL   string `json:"avatar_url"`
	Role        Role   `json:"role"`
	MonthPoints int    `json:"month_points"`
	TotalPoints int    `json:"total_points"`
	Rank        int    `json:"rank"`
	Level       string `json:"level"`
}

type GameType string

const (
	GameVersoFlash     GameType = "verso_flash"
	GameQueHarias      GameType = "que_harias"
	GameReto60         GameType = "reto_60"
	GameVerdaderoFalso GameType = "verdadero_falso"
	GameAhorcado       GameType = "ahorcado"
	GameOrdenaVerso    GameType = "ordena_verso"
)

type GameQuestion struct {
	ID            string    `json:"id"`
	GameType      GameType  `json:"game_type"`
	Question      string    `json:"question"`
	Options       []string  `json:"options"`
	CorrectAnswer string    `json:"correct_answer"`
	BibleRef      string    `json:"bible_ref"`
	Explanation   string    `json:"explanation"`
	Difficulty    int       `json:"difficulty"`
	Active        bool      `json:"active"`
	CreatedAt     time.Time `json:"created_at"`
}

type GameAttempt struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	GameType      GameType  `json:"game_type"`
	PlayedAt      time.Time `json:"played_at"`
	Score         int       `json:"score"`
	MaxScore      int       `json:"max_score"`
	PointsAwarded int       `json:"points_awarded"`
	Completed     bool      `json:"completed"`
	TimeSpentSec  int       `json:"time_spent_sec"`
}

type Badge struct {
	ID          string `json:"id"`
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
	TargetValue int    `json:"target_value"`
	Icon        string `json:"icon"`
	IsExclusive bool   `json:"is_exclusive"`
}

type UserBadgeProgress struct {
	BadgeID     string     `json:"badge_id"`
	Slug        string     `json:"slug"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Category    string     `json:"category"`
	Icon        string     `json:"icon"`
	Current     int        `json:"current"`
	Target      int        `json:"target"`
	Unlocked    bool       `json:"unlocked"`
	UnlockedAt  *time.Time `json:"unlocked_at,omitempty"`
}

type Reflection struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	UserName   string     `json:"user_name,omitempty"`
	VerseRef   string     `json:"verse_ref"`
	Content    string     `json:"content"`
	Status     string     `json:"status"` // pending, approved, rejected
	Feedback   string     `json:"feedback"`
	ReviewedBy *string    `json:"reviewed_by,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type CampPayment struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	UserName      string    `json:"user_name,omitempty"`
	Amount        float64   `json:"amount"`
	PaymentDate   time.Time `json:"payment_date"`
	Method        string    `json:"method"`
	Notes         string    `json:"notes"`
	RegisteredBy  string    `json:"registered_by"`
	RegisteredByName string `json:"registered_by_name,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type FinanceType string

const (
	FinanceIncome  FinanceType = "income"
	FinanceExpense FinanceType = "expense"
)

type FinanceRecord struct {
	ID              string      `json:"id"`
	Type            FinanceType `json:"type"`
	Amount          float64     `json:"amount"`
	Category        string      `json:"category"`
	Description     string      `json:"description"`
	TransactionDate time.Time   `json:"transaction_date"`
	RegisteredBy    string      `json:"registered_by"`
	RegisteredByName string     `json:"registered_by_name,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
}

type Announcement struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Priority  string    `json:"priority"` // low, normal, high, urgent
	Active    bool      `json:"active"`
	CreatedBy string    `json:"created_by"`
	ExpiresAt *time.Time`json:"expires_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
