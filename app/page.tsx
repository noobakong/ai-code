'use client'

// eslint-disable-next-line import/order
import type { CodeItem } from '@/app/store/zustand'
import { useEditor } from '@tldraw/tldraw'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import useStore from '@/app/store/zustand'
import { getResponseFromAPI } from '@/app/util/openai'
import { PreviewModal } from '@/components/PreviewModal'
import { blobToBase64 } from '@/lib/blobToBase64'
import { getSvgAsImage } from '@/lib/getSvgAsImage'
import '@tldraw/tldraw/tldraw.css'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
  ssr: false,
})

export default function Home() {
  const [codeItem, setCodeItem] = useState<CodeItem | null>(null)

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        setCodeItem(null)
    }
    window.addEventListener('keydown', listener)

    return () => {
      window.removeEventListener('keydown', listener)
    }
  })

  return (
    <>
      <div className="w-screen h-screen">
        <Tldraw persistenceKey="tldraw">
          <ExportButton setCodeItem={setCodeItem} />
          <KeyAndApiSettingBtn></KeyAndApiSettingBtn>
          <HistoryPage></HistoryPage>
        </Tldraw>
      </div>
      {codeItem
      && ReactDOM.createPortal(
        <div
          className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
          style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setCodeItem(null)}
        >
          <PreviewModal
            codeItem={codeItem}
            onHandleClose={() => {
              setCodeItem(null)
            }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}

function ExportButton({ setCodeItem }: { setCodeItem: (item: CodeItem) => void }) {
  const editor = useEditor()
  const [loading, setLoading] = useState(false)
  const addRecord = useStore(state => state.addRecord)
  // A tailwind styled button that is pinned to the bottom right of the screen
  return (
    <button
      onClick={async (e) => {
        setLoading(true)
        try {
          e.preventDefault()
          const svg = await editor.getSvg(Array.from(editor.currentPageShapeIds))
          if (!svg)
            return

          const png = await getSvgAsImage(svg, {
            type: 'png',
            quality: 1,
            scale: 1,
          })
          const dataUrl = (await blobToBase64(png!)) as string

          let json = ''
          try {
            json = await getResponseFromAPI(dataUrl)
          }
          catch (error: any) {
            console.log(error)
            alert(`Error from open ai: ${JSON.stringify(error.message)}`)
            return
          }

          const message = json
          const start = message.indexOf('<!DOCTYPE html>')
          const end = message.indexOf('</html>')
          const html = message.slice(start, end + '</html>'.length)
          const date = (new Date()).toLocaleString()
          setCodeItem({ png: dataUrl, html, date })
          addRecord({ png: dataUrl, html, date })
        }
        finally {
          setLoading(false)
        }
      }}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      style={{ zIndex: 1000 }}
      disabled={loading}
    >
      {loading
        ? (
          <div className="flex justify-center items-center ">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
          )
        : (
            '生成代码'
          )}
    </button>
  )
}

function HistoryPage() {
  const [showModal, setShowModal] = useState(false)
  const { history, loadHistory } = useStore()
  useEffect(() => {
    loadHistory()
  }, [])

  const [showCodeItem, setShowCodeItem] = useState<CodeItem | null>(null)
  console.log(history, 'storeHistory')
  return (
    <>
      <button
        onClick={() => {
          setShowModal(true)
        }}
        className=" z-[1000] fixed bottom-[188px] right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      >
        历史记录
      </button>

      {showModal
      && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center"
          style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
        >

          <div className="relative  overflow-auto  flex-wrap max-h-[600px]  bg-white w-[80%] h-1/2 flex">
            {
              history?.map((record, index) => (
                <div key={index} className="w-[200px] flex flex-col items-center h-[200px] border shadow-slate-500 shadow-2xl m-3">

                  <img
                    src={record.png}
                    className="w-full h-full object-contain"
                    alt=""
                    onClick={
                    () => {
                      console.log('@@@@@')
                      setShowCodeItem(record)
                    }
                  }
                  />
                  <div>{record?.date}</div>
                </div>
              )).reverse()

            }

          </div>
          <button
            onClick={() => setShowModal(false)}
            // 在history list的右上角
            className="bg-red-400 mt-2 p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            X关闭X

          </button>
        </div>
      )}

      {showCodeItem
      && ReactDOM.createPortal(
        <div
          className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
          style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowCodeItem(null)}
        >
          <PreviewModal codeItem={showCodeItem} onHandleClose={() => setShowCodeItem(null)} />
        </div>,
        document.body,
      )}
    </>
  )
}

function KeyAndApiSettingBtn() {
  const [showModal, setShowModal] = useState(false)
  const { setAiInfo, aiInfo } = useStore()
  return (
    <>
      <button
        onClick={() => {
          setShowModal(true)
        }}
        className=" z-[1000] fixed bottom-[100px] right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      >
        秘钥设置
      </button>
      {
        showModal
        && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
            style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="bg-white w-[400px] h-[400px] flex flex-col justify-center items-center">
              <div className="flex flex-col justify-center items-center">
                <label htmlFor="">代理地址</label>
                <input
                  id="base_url"
                  type="text"
                  className="mb-3 border w-[300px] h-[40px] rounded-md"
                  placeholder="https://your-base-url/v1/chat/completions"
                  defaultValue={aiInfo.base_url}
                />
                <label htmlFor="">秘钥</label>
                <input
                  type="text"
                  id="key"
                  className="border w-[300px] h-[40px] rounded-md"
                  placeholder="请输入秘钥"
                  defaultValue={aiInfo.key}
                />
              </div>
              <div className="flex">
                <button
                  onClick={
                    () => {
                      const base_url = (document.getElementById('base_url') as HTMLInputElement).value
                      const key = (document.getElementById('key') as HTMLInputElement).value
                      setAiInfo({ base_url, key })
                      setShowModal(false)
                    }
                  }
                  className="bg-blue-400 mt-2 mr-3 p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
                >
                  确定
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-400 mt-2 p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>

  )
}
