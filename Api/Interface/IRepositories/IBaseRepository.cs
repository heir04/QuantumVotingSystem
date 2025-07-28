using System.Linq.Expressions;
using Api.Entities;

namespace Api.Interface.IRepository
{
    public interface IBaseRepository<T> where T : BaseEntity
    {
        Task<T> Create (T entity);
        Task<T> Update(T entity);
        Task<T> GetAsync(Guid id);
        Task<int> Count(Expression<Func<T, bool>> expression);
        Task<T> Get(Expression<Func<T, bool>> expression);
        Task<IList<T>> GetAll(Expression<Func<T, bool>> expression);
        Task<IList<T>> GetAll();
        Task<bool> ExistsAsync(Expression<Func<T, bool>> expression);
    }
}