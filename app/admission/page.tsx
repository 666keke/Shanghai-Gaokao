import Link from 'next/link'
import { FilingExample, AdjustmentExample } from '../../components/admission/RuleExamples'
import s from './admission.module.css'

const source = 'https://www.shmeea.edu.cn/page/08000/20260402/20157.html'
const checklist = [
  '选科符合专业组要求。',
  '已核对体检、语种、单科成绩等录取限制。',
  '了解高校的专业录取办法，以及组内可能调剂到的专业。',
  '按真实就读意愿排序，并留出志愿梯度。',
]

export default function AdmissionGuidePage() {
  return (
    <main className={`${s.page} page-wrap`}>
      <article className={s.article} aria-labelledby="guide-title">
        <header className={s.header}>
          <h1 id="guide-title">录取规则</h1>
          <p className={s.scope}>2026年上海本科普通批次</p>
          <p className={s.intro}>先按成绩和志愿顺序投档，再由高校安排专业。投档成功不等于已经录取。</p>
          <p className={s.source}>依据上海市教育考试院<a href={source} target="_blank" rel="noreferrer">投档录取实施办法</a>（2026年4月2日）。其他批次按相应规定执行。</p>
        </header>

        <section className={s.section} aria-labelledby="filing-title">
          <h2 id="filing-title">志愿怎样投档</h2>
          <div className={s.ruleLayout}>
            <div>
              <p>本科普通批次可填报 <strong>24 个院校专业组</strong>。每组可填 4 个专业志愿，并选择是否服从该组内的专业调剂。</p>
              <ol className={s.steps}>
                <li><h3>按成绩排队</h3><p>系统按投档成绩从高到低处理考生，同分时再按规定比较。排在前面的考生先投档。</p></li>
                <li><h3>按志愿顺序检索</h3><p>轮到你时，从第一个志愿开始，依次检索符合投档条件的专业组，遇到有计划余额的组就投档。</p></li>
                <li><h3>投出后停止检索</h3><p>本轮只向一个专业组投档。投档成功后，后续志愿不再检索，因此应把更想就读的组放在前面。</p></li>
              </ol>
            </div>
            <FilingExample />
          </div>
        </section>

        <section className={s.section} aria-labelledby="admission-title">
          <h2 id="admission-title">进档后怎样录取</h2>
          <div className={s.ruleLayout}>
            <div>
              <p>高校收到档案后，根据招生章程安排专业，并审核体检、单科成绩、外语语种等条件。各校专业录取办法可能不同。</p>
              <p><strong>专业调剂仅限已投档的专业组内，不能跨组调剂。</strong>同一所大学的其他组即使还有名额，也不能调剂过去。</p>
            </div>
            <AdjustmentExample />
          </div>
        </section>

        <section className={s.section} aria-labelledby="questions-title">
          <h2 id="questions-title">常见问题</h2>
          <div className={s.questions}>
            <section>
              <h3>超过去年的最低位次，就能录取吗？</h3>
              <p>不能。招生计划、专业组构成和考生选择都会变化。往年位次只能作为参考，对比多年数据时，也要核对选科要求和组内专业。</p>
            </section>
            <section>
              <h3>同分时，谁先投档？</h3>
              <p>依次比较：语文与数学总分；语文或数学单科最高分；外语成绩；选考科目最高分；选考科目次高分；志愿顺序。前一项相同才比较下一项，志愿顺序也相同的同分同位考生同时投档。</p>
              <p>一分一段表中的位次不能完整反映这套排序。</p>
            </section>
            <section>
              <h3>退档后，会投到下一个志愿吗？</h3>
              <p>本轮不会再检索后续志愿。2026年上海本科普通批次录取后有两次征求志愿，符合条件的未录取考生需要重新填报。第二次实行降分录取政策，是否同意降分由高校决定。资格、缺额计划和时间以考试院当次公告为准。</p>
            </section>
          </div>
        </section>

        <section className={s.section} aria-labelledby="check-title">
          <h2 id="check-title">填报前核对</h2>
          <ul className={s.checklist}>{checklist.map(item => <li key={item}>{item}</li>)}</ul>
          <p className={s.next}><Link href="/lookup">按位次查询专业组 →</Link></p>
        </section>
      </article>
    </main>
  )
}
