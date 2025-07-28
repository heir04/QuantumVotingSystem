using SecurityDriven;

namespace Api.Entities
{
    public class BaseEntity
    {
        public Guid Id { get; set; } = FastGuid.NewGuid();
    }
}