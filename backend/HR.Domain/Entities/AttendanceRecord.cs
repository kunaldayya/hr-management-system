using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace HR.Domain.Entities
{
    public enum AttendanceStatus
    {
        PRESENT,
        ABSENT,
        LATE,
        HALF_DAY,
        ON_LEAVE      
    }

    [Table("AttendanceRecords")]
    public class AttendanceRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        public DateOnly Date { get; set; }

        public DateTimeOffset? ClockInTime { get; set; }
        public DateTimeOffset? ClockOutTime { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? TotalHours { get; set; }

        [Required]
        public AttendanceStatus Status { get; set; } = AttendanceStatus.PRESENT;
        public string? IpAddress { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    }
}
