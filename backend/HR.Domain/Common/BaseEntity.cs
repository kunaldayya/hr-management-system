using MongoDB.Bson.Serialization.Attributes;

namespace HR.Domain.Common
{
    public abstract class BaseEntity
    {
        [BsonElement("Id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [BsonElement("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("UpdatedAt")]
        public DateTime? UpdatedAt { get; set; }

    }
}
